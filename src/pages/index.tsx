import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { useState } from "react";

dayjs.extend(relativeTime);

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  const [input, setInput] = useState("");

  //  start fetching asap
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  const CreatePostWizard = () => {
    const { user } = useUser();

    const { mutate } = api.posts.create.useMutation();

    console.log(user);

    if (!user) return null;

    return (
      <div className="flex w-full gap-3">
        <Image
          src={user.profileImageUrl}
          alt="Profile image"
          className="h-14 w-14 rounded-full"
          width={56}
          height={56}
        />
        <input
          type="text"
          placeholder="Type some emojis"
          className="grow bg-transparent outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={() => mutate({ content: input })}></button>
      </div>
    );
  };

  type PostWithUser = RouterOutputs["posts"]["getAll"][number];

  const PostView = (props: PostWithUser) => {
    const { post, author } = props;
    return (
      <div key={post.id} className="flex gap-3 border-b border-slate-400 p-4">
        <Image
          src={author.profileImageUrl}
          className="h-14 w-14 rounded-full"
          alt={`@${author.username} avatar`}
          width={56}
          height={56}
        />
        <div className="flex flex-col">
          <div className="flex gap-2 text-slate-300">
            <span>{`@${author.username}`}</span>
            <span className="font-thin">{` · ${dayjs(
              post.createdAt
            ).fromNow()}`}</span>
          </div>
          <span className="text-2xl">{post.content}</span>
        </div>
      </div>
    );
  };

  const Feed = () => {
    const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

    if (postsLoading) return <LoadingPage />;

    if (!data) return <div>Something went wrong</div>;

    return (
      <div className="flex flex-col">
        {[...data, ...data]?.map((fullPost) => (
          <PostView {...fullPost} key={fullPost.post.id} />
        ))}
      </div>
    );
  };
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="w-full border-x border-slate-400 md:max-w-2xl">
          <div className="flex border-b border-slate-400 p-4">
            {!isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {isSignedIn && <CreatePostWizard />}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
