import { StateProvider } from "@/context/StateContext";
import "@/styles/globals.css";
import Head from "next/head";
import reducer, { initialState } from "@/context/StateReducers";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";

export default function App({ Component, pageProps }) {
  return (
    <Provider>
      <Toaster />
      <StateProvider initialState={initialState} reducer={reducer}>
        <Head>
          <title>Twakify</title>
          <link rel="shortcut icon" href="/favicon.png" />
        </Head>
        <Component {...pageProps} />
      </StateProvider>
    </Provider>
  );
}
