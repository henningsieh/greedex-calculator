import { loader } from "fumadocs-core/source";

// import { docs } from "fumadocs-mdx:collections/server";
import { docs } from "../../../docs/.source/index";

// raw collection
// console.log(docs);

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});
