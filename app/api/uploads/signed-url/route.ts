import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/guards";
import {
  buildDocumentStoragePath,
  createDocumentSignedUploadUrl,
} from "@/lib/storage/documents";
import { handleApiError } from "@/lib/utils/errors";
import { signedUrlRequestSchema } from "@/lib/validations/document";

export async function POST(request: Request) {
  try {
    const { user } = await requireApiUser();
    const body = await request.json();
    const parsed = signedUrlRequestSchema.parse(body);

    const documentId = crypto.randomUUID();
    const storagePath = buildDocumentStoragePath(user.id, documentId, parsed.fileName);
    const signed = await createDocumentSignedUploadUrl(storagePath);

    return NextResponse.json({
      documentId,
      storagePath,
      signedUrl: signed.signedUrl,
      token: signed.token,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
