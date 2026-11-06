import '@testing-library/jest-dom/vitest';
import {cleanup} from '@testing-library/react';
import {afterEach,beforeEach,vi} from 'vitest';
vi.mock('next/navigation',()=>({useRouter:()=>({push:vi.fn(),replace:vi.fn(),refresh:vi.fn()})}));
afterEach(cleanup);

import {resetSimulation} from '../lib/simulation';
beforeEach(()=>resetSimulation());
