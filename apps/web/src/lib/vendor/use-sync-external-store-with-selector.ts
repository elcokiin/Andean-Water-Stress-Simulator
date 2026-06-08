import {
  useDebugValue,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

type SnapshotGetter<Snapshot> = () => Snapshot;
type Selector<Snapshot, Selection> = (snapshot: Snapshot) => Selection;
type EqualityFn<Selection> = (a: Selection, b: Selection) => boolean;

export function useSyncExternalStoreWithSelector<Snapshot, Selection>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: SnapshotGetter<Snapshot>,
  getServerSnapshot: SnapshotGetter<Snapshot> | undefined,
  selector: Selector<Snapshot, Selection>,
  isEqual?: EqualityFn<Selection>,
): Selection {
  const instRef = useRef<{ hasValue: boolean; value: Selection | null } | null>(
    null,
  );

  if (instRef.current === null) {
    instRef.current = { hasValue: false, value: null };
  }

  const [getSelection, getServerSelection] = useMemo(() => {
    let hasMemo = false;
    let memoizedSnapshot: Snapshot;
    let memoizedSelection: Selection;

    const memoizedSelector = (nextSnapshot: Snapshot) => {
      if (!hasMemo) {
        hasMemo = true;
        memoizedSnapshot = nextSnapshot;

        const nextSelection = selector(nextSnapshot);
        const currentValue = instRef.current;

        if (
          isEqual !== undefined &&
          currentValue?.hasValue &&
          isEqual(currentValue.value as Selection, nextSelection)
        ) {
          memoizedSelection = currentValue.value as Selection;
          return memoizedSelection;
        }

        memoizedSelection = nextSelection;
        return memoizedSelection;
      }

      if (Object.is(memoizedSnapshot, nextSnapshot)) {
        return memoizedSelection;
      }

      const nextSelection = selector(nextSnapshot);

      if (isEqual !== undefined && isEqual(memoizedSelection, nextSelection)) {
        memoizedSnapshot = nextSnapshot;
        return memoizedSelection;
      }

      memoizedSnapshot = nextSnapshot;
      memoizedSelection = nextSelection;
      return memoizedSelection;
    };

    const getSnapshotWithSelector = () => memoizedSelector(getSnapshot());
    const getServerSnapshotWithSelector =
      getServerSnapshot === undefined
        ? undefined
        : () => memoizedSelector(getServerSnapshot());

    return [getSnapshotWithSelector, getServerSnapshotWithSelector] as const;
  }, [getSnapshot, getServerSnapshot, selector, isEqual]);

  const value = useSyncExternalStore(
    subscribe,
    getSelection,
    getServerSelection,
  );

  useEffect(() => {
    const currentValue = instRef.current;
    if (currentValue) {
      currentValue.hasValue = true;
      currentValue.value = value;
    }
  }, [value]);

  useDebugValue(value);

  return value;
}

export default { useSyncExternalStoreWithSelector };
