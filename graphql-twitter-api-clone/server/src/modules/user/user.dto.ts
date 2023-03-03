import { IsEmail, Length } from "class-validator";
import { Field, ID, InputType, ObjectType } from "type-graphql";

@ObjectType()
export class User {
  @Field(() => ID, { nullable: false })
  id: string;

  @Field({ nullable: false })
  username: string;

  @Field({ nullable: false })
  email: string;

  password: string;
}

@InputType()
export class RegisterUserInput {
  @Field({
    nullable: false,
  })
  username: string;

  @Field({
    nullable: false,
  })
  @IsEmail()
  email: string;

  @Field()
  @Length(6, 56)
  password: string;
}

@InputType()
export class LoginInput {
  @Field({
    nullable: false,
  })
  usernameOrEmail: string;

  @Field()
  @Length(6, 56)
  password: string;
}

@ObjectType()
export class UserFollowers {
  @Field()
  count: number;

  @Field(() => [User])
  items: User[];
}

@InputType()
export class FollowUserInput {
  @Field({
    nullable: false,
  })
  username: string;
}
