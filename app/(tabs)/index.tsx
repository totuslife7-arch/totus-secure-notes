import { Redirect } from 'expo-router';

/** Default tab entry — Home is the front door. */
export default function TabsIndexRedirect() {
  return <Redirect href={'/home' as never} />;
}
