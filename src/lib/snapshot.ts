import JSZip from 'jszip';

export interface VFile {
  path: string;
  content: string;
}

export async function createSnapshotZip(files: VFile[]): Promise<File> {
  const zip = new JSZip();
  for (const f of files) {
    // skip empty or internal ignored files
    if (!f.path || f.path.includes('.git/') || f.path.includes('node_modules/') || f.path.includes('dist/')) continue;
    zip.file(f.path, f.content);
  }
  
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15);
  const blob = await zip.generateAsync({ type: 'blob' });
  const file = new File([blob], `dead-drop-lockers-snapshot-${timestamp}.zip`, { type: 'application/zip' });
  return file;
}

// In Shakespeare VFS, we can't easily traverse the FS from client-side JS without user interaction or an API.
// For MVP, we will rely on a hardcoded list of essential files or instruct the user.
// Since Shakespeare runs in browser, we can't call `fs.readdir` directly in client code.
//
// Workaround: We will snapshot only files that are explicitly imported or listed.
// Better Workaround: We assume the user runs this in dev mode and we fetch files from the dev server? No.
//
// Best MVP Solution: Use a File System Access API directory handle (if supported), or just zip a known subset.
// Since we are running INSIDE the chatbot context to generate code, we can read the files HERE and write a static JSON manifest.
// But the user wants to publish future snapshots themselves.
//
// For this specific 'Publish Snapshot' feature to work in the deployed app, the app needs access to its own source.
// This is not typically available in a built React app unless we bundle the source.
//
// Alternative: We will assume this snapshot feature is only for "exporting current state" IF the user uploads a directory.
//
// Actually, since Shakespeare is an editor, maybe we can assume the user downloads the zip via Shakespeare UI and then uploads it?
//
// Let's implement a simple "Upload Source Zip & Publish" flow instead of auto-gathering.
// This is reliable: User zips project -> Selects zip -> We upload to Blossom and Publish Event.

export const SNAPSHOT_KIND = 30023;
export const SNAPSHOT_D_TAG = 'dead-drop-lockers@v1';
export const SNAPSHOT_TITLE = 'Dead Drop Lockers Source Snapshot';
