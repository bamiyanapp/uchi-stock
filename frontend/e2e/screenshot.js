import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.join(process.cwd(), 'e2e-screenshots');

// dev-standardsのE2Eスクリーンショット報告機能（docs/cicd-pipeline-specification.md「1. CIワークフロー」参照）の
// 呼び出し規約に従い、<frontend_dir>/e2e-screenshots/<name>.pngへPNGを書き出す。
export async function captureScreenshot(page, testInfo, name, caption) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}.png`) });

  if (caption) {
    fs.writeFileSync(path.join(SCREENSHOT_DIR, `${name}.caption.txt`), caption, 'utf-8');
  }

  // テストケース単位の関連スクリーンショット折りたたみ判定に使う付随情報
  fs.writeFileSync(path.join(SCREENSHOT_DIR, `${name}.spec.txt`), path.basename(testInfo.file), 'utf-8');
  fs.writeFileSync(path.join(SCREENSHOT_DIR, `${name}.title.txt`), testInfo.title, 'utf-8');
}
