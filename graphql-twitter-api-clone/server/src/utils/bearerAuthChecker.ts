import { AuthChecker } from "type-graphql";
import { Context } from "./createServer";

export const bearerAuthChecker: AuthChecker<Context> = ({ context }) => {
  return context.user ? true : false;
};
