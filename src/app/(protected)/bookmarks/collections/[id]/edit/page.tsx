import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CollectionForm } from "@/features/bookmark/components/CollectionForm";
import { BackLink } from "@/components/common/BackLink";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCollectionPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const collection = await prisma.bookmarkCollection.findUnique({
    where: { id },
  });

  if (!collection) {
    notFound();
  }

  if (collection.userId !== session.user.id) {
    redirect("/bookmarks");
  }

  return (
    <div className="container max-w-2xl py-8">
      <BackLink href="/bookmarks" label="ブックマークに戻る" />
      <h1 className="text-2xl font-bold mb-6">コレクションを編集</h1>
      <CollectionForm
        mode="edit"
        collectionId={id}
        initialData={{
          name: collection.name,
          description: collection.description || undefined,
          isPublic: collection.isPublic,
        }}
      />
    </div>
  );
}
