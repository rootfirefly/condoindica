// app/components/Skeletons.tsx
import React from 'react';
import { Skeleton } from '@mui/material';

const PostSkeleton = () => (
  <div>
    <Skeleton variant="rectangular" width="100%" height={200} />
    <Skeleton variant="text" sx={{ mt: 1 }} />
    <Skeleton variant="text" sx={{ mt: 1 }} />
  </div>
);

const IndicacaoSkeleton = () => (
  <div>
    <Skeleton variant="rectangular" width="100%" height={100} />
    <Skeleton variant="text" sx={{ mt: 1 }} />
  </div>
);

const NewPostSkeleton = () => (
  <div>
    <Skeleton variant="circular" width={40} height={40} />
    <Skeleton variant="text" sx={{ ml: 2, mt: 1 }} />
  </div>
);

export { PostSkeleton, IndicacaoSkeleton, NewPostSkeleton };

