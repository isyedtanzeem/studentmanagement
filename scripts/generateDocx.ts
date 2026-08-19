import * as fs from 'fs';
import * as path from 'path';
import { generateProjectSynopsisDocx } from '../src/utils/synopsisDocxGenerator';

async function main() {
  console.log('Generating ScholarCore Project Synopsis DOCX...');
  const buffer = await generateProjectSynopsisDocx();
  
  const rootPath = path.resolve(process.cwd(), 'ScholarCore_Project_Synopsis.docx');
  fs.writeFileSync(rootPath, buffer);
  console.log(`Successfully generated DOCX at: ${rootPath} (${buffer.length} bytes)`);

  // Also ensure public directory exists and write there
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const publicPath = path.resolve(publicDir, 'ScholarCore_Project_Synopsis.docx');
  fs.writeFileSync(publicPath, buffer);
  console.log(`Also saved to public directory: ${publicPath}`);
}

main().catch(err => {
  console.error('Error generating DOCX:', err);
  process.exit(1);
});
