import { redirect } from "next/navigation";

export default function ChatPage() {
  // Chat is now integrated as an overlay panel via ChatFAB
  // Just redirect to pipeline - user can click ASK button to open chat
  redirect("/pipeline");
}
