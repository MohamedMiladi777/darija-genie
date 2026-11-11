import { BlobServiceClient } from "@azure/storage-blob";

/**
 * Azure Blob Storage access for audio files.
 *
 * Server-side only — the connection string must never reach browser code.
 * The database stores `container` + `storageKey`; audio bytes live only here.
 */

const DEFAULT_CONTAINER = "audio";

let serviceClient: BlobServiceClient | null = null;

export function getBlobService(): BlobServiceClient {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error(
      "AZURE_STORAGE_CONNECTION_STRING is not set. Add it to apps/web/.env.local (see .env.example).",
    );
  }
  if (!serviceClient) {
    serviceClient = BlobServiceClient.fromConnectionString(connectionString);
  }
  return serviceClient;
}

function getContainerClient(name: string = DEFAULT_CONTAINER) {
  return getBlobService().getContainerClient(name);
}

/** Public URL of a blob, assuming the container allows anonymous read. */
export function publicAudioUrl(storageKey: string, container: string = DEFAULT_CONTAINER): string {
  const endpoint = getBlobService().url.replace(/\/$/, "");
  return `${endpoint}/${container}/${storageKey}`;
}

export interface UploadAudioResult {
  container: string;
  storageKey: string;
  url: string;
}

/**
 * Upload an audio buffer and return the identifiers to persist in Postgres.
 * Keys are namespaced by kind, e.g. `vocab/salam.mp3`.
 */
export async function uploadAudio(
  buffer: Buffer,
  options: {
    storageKey: string;
    contentType?: string;
    container?: string;
  },
): Promise<UploadAudioResult> {
  const container = options.container ?? DEFAULT_CONTAINER;
  const containerClient = getContainerClient(container);

  const blobClient = containerClient.getBlockBlobClient(options.storageKey);
  await blobClient.uploadData(buffer, {
    blobHTTPHeaders: options.contentType
      ? { blobContentType: options.contentType }
      : undefined,
  });

  return {
    container,
    storageKey: options.storageKey,
    url: publicAudioUrl(options.storageKey, container),
  };
}

/** Download a blob's contents (for verification or server-side use). */
export async function downloadAudio(
  storageKey: string,
  container: string = DEFAULT_CONTAINER,
): Promise<Buffer> {
  const blobClient = getContainerClient(container).getBlobClient(storageKey);
  return Buffer.from(await blobClient.downloadToBuffer());
}

/** Delete a blob (e.g. when removing an audio asset). */
export async function deleteAudio(
  storageKey: string,
  container: string = DEFAULT_CONTAINER,
): Promise<void> {
  await getContainerClient(container).deleteBlob(storageKey, { deleteSnapshots: "include" });
}
