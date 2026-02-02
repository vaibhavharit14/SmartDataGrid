
import { useMemo } from 'react';

type UseVirtualizerProps = {
    count: number;
    getScrollElement: () => HTMLElement | null;
    estimateSize: (index: number) => number;
    overscan?: number;
    scrollOffset: number;
    containerSize: number;
};

export type VirtualItem = {
    index: number;
    start: number;
    size: number;
    end: number;
};

export function useVirtualizer({
    count,
    estimateSize,
    overscan = 5,
    scrollOffset,
    containerSize
}: UseVirtualizerProps) {

    // Check if fixed size for optimization
    const isFixedSize = useMemo(() => {
        if (count === 0) return true;
        const s1 = estimateSize(0);
        const s2 = estimateSize(Math.max(0, count - 1));
        const s3 = estimateSize(Math.floor(count / 2));
        return s1 === s2 && s1 === s3;
    }, [count, estimateSize]);

    const fixedSize = isFixedSize ? estimateSize(0) : 0;

    // Total size calculation - O(1) if fixed
    const totalSize = useMemo(() => {
        if (isFixedSize) return count * fixedSize;

        let size = 0;
        for (let i = 0; i < count; i++) {
            size += estimateSize(i);
        }
        return size;
    }, [count, estimateSize, isFixedSize, fixedSize]);

    const virtualItems = useMemo(() => {
        if (count === 0) return [];

        const rangeStart = scrollOffset;
        const rangeEnd = rangeStart + containerSize;

        let startIndex = 0;
        let endIndex = 0;

        if (isFixedSize) {
            startIndex = Math.floor(rangeStart / fixedSize);
            endIndex = Math.ceil(rangeEnd / fixedSize);
        } else {
            // Variable height fallback (Linear Scan O(N))
            let currentOffset = 0;
            let startFound = false;
            for (let i = 0; i < count; i++) {
                const size = estimateSize(i);
                const itemEnd = currentOffset + size;
                if (!startFound && itemEnd > rangeStart) {
                    startIndex = i;
                    startFound = true;
                }
                if (currentOffset <= rangeEnd) {
                    endIndex = i;
                } else {
                    break;
                }
                currentOffset += size;
            }
        }

        startIndex = Math.max(0, startIndex - overscan);
        endIndex = Math.min(count - 1, endIndex + overscan);

        const items: VirtualItem[] = [];
        let accumulatedTop = 0;

        // Calculate offset for the first visible item
        if (isFixedSize) {
            accumulatedTop = startIndex * fixedSize;
        } else {
            for (let k = 0; k < startIndex; k++) {
                accumulatedTop += estimateSize(k);
            }
        }

        for (let i = startIndex; i <= endIndex; i++) {
            const size = isFixedSize ? fixedSize : estimateSize(i);
            items.push({
                index: i,
                start: accumulatedTop,
                size,
                end: accumulatedTop + size,
            });
            accumulatedTop += size;
        }

        return items;

    }, [count, estimateSize, overscan, scrollOffset, containerSize, isFixedSize, fixedSize]);

    return { virtualItems, totalSize };
}
