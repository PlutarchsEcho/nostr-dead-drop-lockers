import { useRef, useState } from 'react';
import { createSnapshotZip, SNAPSHOT_D_TAG, SNAPSHOT_TITLE, SNAPSHOT_KIND } from '@/lib/snapshot';
import { useUploadFile } from '@/hooks/useUploadFile';
import { useNostrPublish } from '@/hooks/useNostrPublish';

export default function SnapshotPublisher() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const upload = useUploadFile();
  const publish = useNostrPublish();

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setSelectedFile(f);
  };

  const handleUploadAndPublish = async () => {
    if (!selectedFile) return;
    try {
      const tags = await upload.mutateAsync(selectedFile);
      // tags is array of NIP-94 style tags (e.g. [['imeta', 'url ...']])
      // Publish an addressable event linking to the uploaded zip
      await publish.mutateAsync({
        kind: SNAPSHOT_KIND,
        content: `${SNAPSHOT_TITLE}: snapshot uploaded`,
        tags: [
          ['d', SNAPSHOT_D_TAG],
          ['title', SNAPSHOT_TITLE],
          ['t', 'code-snapshot'],
          ...tags,
        ],
      });
      alert('Snapshot published to Nostr');
    } catch (err: any) {
      alert('Upload or publish failed: ' + err.message);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Publish Snapshot to Nostr</h2>
      <p className="text-sm text-muted-foreground mb-4">Create a zip of your project locally and upload it here to publish a Nostr snapshot event.</p>
      <input type="file" ref={fileInputRef} onChange={handleSelect} accept=".zip" />
      <div className="mt-4">
        <button className="btn" onClick={handleUploadAndPublish} disabled={!selectedFile}>Upload & Publish</button>
      </div>
    </div>
  );
}
