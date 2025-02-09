import SearchBar from "./components/SearchBar";
import NavBar from "./components/NavBar";
import SearchItems from "./components/SearchItems";
import { QueryClientProvider } from "@tanstack/react-query";
function App() {
  return (
    <>
      <NavBar />
      {/* <SearchBar /> */}
      <SearchItems />
      <div></div>
    </>
  );
}

export default App;
