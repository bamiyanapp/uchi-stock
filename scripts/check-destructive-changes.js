const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function getResolvedConfig(configPath) {
  try {
    const cmd = `npx serverless print --config ${configPath} --format json`;
    // Set interactive to false to avoid spinners and prompts
    const env = { ...process.env, SLS_INTERACTIVE_SETUP_ENABLE: "false" };
    const output = execSync(cmd, { encoding: "utf8", cwd: "backend", env });

    // Remove ANSI escape sequences
    const cleanOutput = output.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");

    // Extract JSON from output (in case of spinners or other noise)
    const jsonMatch = cleanOutput.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in output");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error(`Error resolving serverless config ${configPath}:`, error.message);
    if (error.stdout) {
      console.error("Stdout:", error.stdout);
    }
    return null;
  }
}

function checkDestructiveChanges() {
  console.log("Resolving current configuration...");
  const currentConfig = getResolvedConfig("serverless.yml");
  if (!currentConfig) {
    console.error("Could not resolve current configuration. Skipping check.");
    return;
  }

  const previousConfigPath = path.join("backend", "serverless.old.yml");
  try {
    const previousContent = execSync("git show HEAD:backend/serverless.yml", { encoding: "utf8" });
    fs.writeFileSync(previousConfigPath, previousContent);
    console.log("Resolving previous configuration...");
    const previousConfig = getResolvedConfig("serverless.old.yml");
    fs.unlinkSync(previousConfigPath);

    if (!previousConfig) {
      console.error("Could not resolve previous configuration. Skipping comparison.");
      return;
    }

    const currentResources = currentConfig.resources?.Resources || {};
    const previousResources = previousConfig.resources?.Resources || {};

    const warnings = [];

    for (const [resId, prevRes] of Object.entries(previousResources)) {
      if (prevRes.Type === "AWS::DynamoDB::Table") {
        const currRes = currentResources[resId];

        if (!currRes) {
          warnings.push(`DynamoDB Table resource "${resId}" has been REMOVED.`);
          continue;
        }

        const prevProps = prevRes.Properties;
        const currProps = currRes.Properties;

        if (prevProps.TableName !== currProps.TableName) {
          warnings.push(
            `TableName for "${resId}" changed from "${prevProps.TableName}" to "${currProps.TableName}".`
          );
        }

        if (JSON.stringify(prevProps.KeySchema) !== JSON.stringify(currProps.KeySchema)) {
          warnings.push(`KeySchema for "${resId}" has changed.`);
        }

        if (JSON.stringify(prevProps.AttributeDefinitions) !== JSON.stringify(currProps.AttributeDefinitions)) {
          warnings.push(`AttributeDefinitions for "${resId}" have changed.`);
        }
      }
    }

    if (warnings.length > 0) {
      console.error("\n⚠️  DESTRUCTIVE CHANGES DETECTED  ⚠️");
      warnings.forEach((w) => console.error(`- ${w}`));
      console.error("\nDynamoDB changes detected that may lead to data loss if not handled correctly.");
      console.error("Please ensure you have a backup before proceeding.");

      if (process.env.FORCE_DEPLOY !== "true") {
        console.error("\nSet FORCE_DEPLOY=true environment variable to bypass this check.");
        process.exit(1);
      } else {
        console.warn("\nFORCE_DEPLOY is set to true. Proceeding despite destructive changes.");
      }
    } else {
      console.log("No destructive changes detected in DynamoDB configuration.");
    }
  } catch (error) {
    if (fs.existsSync(previousConfigPath)) fs.unlinkSync(previousConfigPath);
    console.warn("Could not get previous version from git. Skipping comparison.");
  }
}

checkDestructiveChanges();
