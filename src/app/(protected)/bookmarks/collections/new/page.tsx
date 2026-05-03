import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CollectionForm } from "@/features/bookmark/components/CollectionForm";
import { BackLink } from "@/components/common/BackLink";

export default async function NewCollectionPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="container max-w-2xl pb-8">
      <BackLink href="/bookmarks" label="ブックマークに戻る" />
      <h1 className="text-2xl font-bold mb-6">新しいコレクション</h1>
      <CollectionForm mode="create" />
    </div>
  );
}
