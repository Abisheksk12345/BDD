import { redirect } from "next/navigation";

export default function ProjectPage({ params }: { params: { id: string } }) {
  return redirect(`/project/${params.id}/dashboard`);
}
