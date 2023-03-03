import { ApolloError } from "apollo-server-core";
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Context } from "../../utils/createServer";
import {
  FollowUserInput,
  LoginInput,
  RegisterUserInput,
  User,
  UserFollowers,
} from "./user.dto";
import {
  createUser,
  findUserFollowedBy,
  findUserFollowing,
  findUsers,
  followUser,
  login,
  unfollowUser,
} from "./user.service";

@Resolver(() => User)
class UserResolver {
  @Mutation(() => User)
  async register(@Arg("input") input: RegisterUserInput) {
    try {
      const user = await createUser(input);
      return user;
    } catch (e) {
      throw e;
    }
  }

  @Authorized()
  @Query(() => User)
  me(@Ctx() context: Context) {
    return context.user;
  }

  @Mutation(() => String)
  async login(@Arg("input") input: LoginInput, @Ctx() context: Context) {
    const token = await login(input, context);

    return token;
  }

  @Query(() => [User])
  async users() {
    return findUsers();
  }

  @Authorized()
  @Mutation(() => User)
  async followUser(
    @Arg("input") input: FollowUserInput,
    @Ctx() context: Context
  ) {
    try {
      const result = await followUser({ ...input, userId: context.user?.id! });
      return result;
    } catch (e: any) {
      throw new ApolloError(e);
    }
  }

  @Authorized()
  @Mutation(() => User)
  async unfollowUser(
    @Arg("input") input: FollowUserInput,
    @Ctx() context: Context
  ) {
    const result = await unfollowUser({ ...input, userId: context.user?.id! });

    return result;
  }

  @FieldResolver(() => UserFollowers)
  async followers(@Root() user: User) {
    const data = await findUserFollowedBy(user.id);

    return {
      count: data?.followedBy.length,
      items: data?.followedBy,
    };
  }

  @FieldResolver(() => UserFollowers)
  async following(@Root() user: User) {
    const data = await findUserFollowing(user.id);

    return {
      count: data?.following.length,
      items: data?.following,
    };
  }
}

export default UserResolver;
