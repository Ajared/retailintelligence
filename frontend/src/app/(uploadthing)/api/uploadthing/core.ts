import { auth } from '~/app/(auth)/auth';
import { UploadThingError } from 'uploadthing/server';
import { createUploadthing, type FileRouter } from 'uploadthing/next';

const session = await auth();

const f = createUploadthing();
export const uploadRouter = {
  imageUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: '4MB',
      maxFileCount: 10,
    },
  })
    .middleware(async ({ req }) => {
      const user = session?.user;

      if (!user) throw new UploadThingError('Unauthorized');

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, fileUrl: file.ufsUrl };
    }),
} satisfies FileRouter;

// ...
f({}).middleware(({ req }) => {
  //           ^? req: NextRequest
  return {};
});

export type UploadRouter = typeof uploadRouter;
