import { redirect } from "next/navigation";

export default function Page() {
  redirect("/produtos?condicao=USADO");
}
