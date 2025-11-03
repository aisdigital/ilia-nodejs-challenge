type Left<L> = {
  readonly _tag: 'Left'
  readonly left: L;
}

type Right<R> = {
  readonly _tag: 'Right'
  readonly right: R
}

export type Either<L, R> = Left<L> | Right<R>

export const Left = <L>(l: L): Either<L, never> => ({
  _tag: 'Left',
  left: l
})

export const Right = <R>(r: R): Either<never, R> => ({
  _tag: 'Right',
  right: r
})

export const isLeft = <L, R>(e: Either<L, R>): e is Left<L> => e._tag === 'Left'
export const isRight = <L, R>(e: Either<L, R>): e is Right<R> => e._tag === 'Right'
