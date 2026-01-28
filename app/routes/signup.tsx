import { useNavigate } from "react-router";

import { SignupForm } from "~/components/signup";
import { useAppStore } from "~/stores/use-app-store";
import { useSignupStore } from "~/stores/use-signup-store";

export default function SignupPage() {
  const navigate = useNavigate();
  const email = useSignupStore((s) => s.email);
  const setSignupData = useSignupStore((s) => s.setData);
  const createEmptyApplication = useAppStore((s) => s.createEmptyApplication);

  const handleSubmit = (data: { name: string; role: string; company: string }) => {
    setSignupData({ ...data, email: email ?? "" });
    // Create a new app and navigate directly to it with auto-generation
    const app = createEmptyApplication();
    navigate(`/studio/${app.id}?autoGenerate=true`);
  };

  return <SignupForm onSubmit={handleSubmit} />;
}
