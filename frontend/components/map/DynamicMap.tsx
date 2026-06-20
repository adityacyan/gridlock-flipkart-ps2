"use client";

import dynamic from "next/dynamic";

const BengaluruMap = dynamic(
    () => import("./BengaluruMap"),
    { ssr: false }
);

export default BengaluruMap;