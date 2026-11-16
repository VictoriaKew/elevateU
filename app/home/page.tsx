import { redirect } from "next/navigation";

// The authenticated experience lives at the root homepage.
export default function HomeRedirect() { redirect("/"); }
