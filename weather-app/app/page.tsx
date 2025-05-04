import type { NextPage } from "next";
import Weather from "./_components/Weather";

const Home: NextPage = () => {
  return (
    <main>
      <Weather />
    </main>
  );
};

export default Home;
