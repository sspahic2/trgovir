'use client';

import { Suspense, useEffect, useState } from "react";
import TableCreateContent from "./TableCreationContent";

export default function TableCreatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TableCreateContent />
    </Suspense>
  );
}
