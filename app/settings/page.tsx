import { requireUser } from "../auth";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <SettingsClient
      displayName={user.displayName}
      email={user.email}
    />
  );
}
