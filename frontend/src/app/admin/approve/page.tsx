import { Suspense } from 'react';
import { Skeleton } from '~/components/ui/skeleton';
import { ApprovalContent } from './_components/approval-content';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

function ApprovalSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-32 mt-4" />
        </CardContent>
      </Card>
    </div>
  );
}

export default async function ApprovePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <Suspense fallback={<ApprovalSkeleton />}>
        <ApprovalContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
