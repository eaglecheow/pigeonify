class NoResultException extends Error {
    constructor(errMessage: string) {
        super(errMessage);

        Object.setPrototypeOf(this, NoResultException.prototype);
    }
}

export default NoResultException;