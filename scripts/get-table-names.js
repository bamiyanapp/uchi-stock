const { execSync } = require("child_process");

function getTableNames() {
  try {
    const cmd = `npx serverless print --format json`;
    const env = { ...process.env, SLS_INTERACTIVE_SETUP_ENABLE: "false" };
    const output = execSync(cmd, { encoding: "utf8", cwd: "backend", env });

    // Remove ANSI escape sequences
    const cleanOutput = output.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");

    const jsonMatch = cleanOutput.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in serverless print output");
    }

    const config = JSON.parse(jsonMatch[0]);
    const resources = config.resources?.Resources || {};
    const tableNames = Object.values(resources)
      .filter((res) => res.Type === "AWS::DynamoDB::Table")
      .map((res) => res.Properties.TableName);

    console.log(tableNames.join(" "));
  } catch (error) {
    console.error("Error getting table names:", error.message);
    process.exit(1);
  }
}

getTableNames();
