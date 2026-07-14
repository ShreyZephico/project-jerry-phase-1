import { Redirect } from 'expo-router';

// Entry redirects to splash. Swap this later for auth session checks.
export default function Index() {
  return <Redirect href="/splash" />;
}
