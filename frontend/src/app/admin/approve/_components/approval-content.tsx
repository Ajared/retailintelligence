import Link from 'next/link';
import { bulkVerifyUsers } from '../../actions';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';

export async function ApprovalContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const userIdsParam = params.userIds || params.userId;

  if (!userIdsParam) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Invalid Approval Link
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Invalid Request</AlertTitle>
              <AlertDescription>
                No user IDs provided in the approval link.
              </AlertDescription>
            </Alert>
            <Button asChild variant="outline" className="w-fit">
              <Link href="/admin/users">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  let userIds: string[] = [];
  if (Array.isArray(userIdsParam)) {
    userIds = userIdsParam;
  } else {
    userIds = userIdsParam
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
  }

  if (userIds.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Invalid Approval Link
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Invalid Request</AlertTitle>
              <AlertDescription>Invalid user IDs provided.</AlertDescription>
            </Alert>
            <Button asChild variant="outline" className="w-fit">
              <Link href="/admin/users">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const invalidIds = userIds.filter((id) => !uuidRegex.test(id));

  if (invalidIds.length > 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Invalid Approval Link
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Invalid Request</AlertTitle>
              <AlertDescription>
                One or more user IDs are invalid.
              </AlertDescription>
            </Alert>
            <Button asChild variant="outline" className="w-fit">
              <Link href="/admin/users">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const response = await bulkVerifyUsers(userIds);

  if ('error' in response) {
    const errorMessage = Array.isArray(response.error)
      ? response.error.join(', ')
      : response.error;
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Approval Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {errorMessage || response.message || 'Failed to approve users.'}
              </AlertDescription>
            </Alert>
            <Button asChild variant="outline" className="w-fit">
              <Link href="/admin/users">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const count = response.data?.length || userIds.length;
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            Users Approved Successfully
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-300">
              Success
            </AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-400">
              {count === 1
                ? '1 user has been successfully approved.'
                : `${count} users have been successfully approved.`}
            </AlertDescription>
          </Alert>
          <Button asChild className="w-fit">
            <Link href="/admin/locations">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
