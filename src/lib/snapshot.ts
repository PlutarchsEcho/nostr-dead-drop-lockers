import JSZip from 'jszip';
import { useUploadFile } from '@/hooks/useUploadFile';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export async function createSnapshotZip(files: { path: string; content: string }[]) {
  const zip = new JSZip();
  for (const f of files) {
    zip.file(f.path, f.content);
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  const file = new File([blob], `dead-drop-lockers-snapshot.zip`, { type: 'application/zip' });
  return file;
}

export async function gatherProjectFiles(fs: any) {
  // This helper will try to read project files from the VFS used by Shakespeare.
  // We'll include key files and exclude node_modules, .git, dist
  const paths = [
    'package.json',
    'NIP.md',
    'README.md',
    'src/',
    'public/',
  ];

  const files: { path: string; content: string }[] = [];

  for (const p of paths) {
    try {
      // naive: read entire file(s). In the browser environment we have access to VFS via functions, but here we assume a helper provided.
      // We'll attempt to read files recursively if needed.
      // For now, placeholder - the actual implementation runs in the app and reads the VFS.
    } catch (err) {
      console.warn('gatherProjectFiles: failed to read', p, err);
    }
  }

  return files;
}
