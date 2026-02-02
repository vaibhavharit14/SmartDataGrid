
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

    // Total size calculation - O(1) if fixed, else O(N)
    const totalSize = useMemo(() => {
        // Assume fixed size if we can, or just loop once.
        // For 50k, looping once on 'count' change is fine.
        let size = 0;
        for (let i = 0; i < count; i++) {
            size += estimateSize(i);
        }
        return size;
    }, [count, estimateSize]);

    const virtualItems = useMemo(() => {
        const rangeStart = scrollOffset;
        const rangeEnd = rangeStart + containerSize;

        let startIndex = 0;
        let endIndex = 0;

        // OPTIMIZATION: If estimateSize(0) === estimateSize(count-1), we assume fixed height to avoid O(N) scan
        const size0 = estimateSize(0);
        const sizeN = estimateSize(Math.max(0, count - 1));

        if (size0 === sizeN) {
            startIndex = Math.floor(rangeStart / size0);
            endIndex = Math.ceil(rangeEnd / size0);
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
        if (size0 === sizeN) {
            accumulatedTop = startIndex * size0;
        } else {
            for (let k = 0; k < startIndex; k++) {
                accumulatedTop += estimateSize(k);
            }
        }

        for (let i = startIndex; i <= endIndex; i++) {
            const size = estimateSize(i);
            items.push({
                index: i,
                start: accumulatedTop,
                size,
                end: accumulatedTop + size,
            });
            accumulatedTop += size;
        }

        return items;

    }, [count, estimateSize, overscan, scrollOffset, containerSize]);

    return { virtualItems, totalSize };
}
