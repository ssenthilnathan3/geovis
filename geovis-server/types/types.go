package types

// ContextKey is a custom type for context keys
type ContextKey string

// UserIDKey is the key used for storing and retrieving the user ID from context
const UserIDKey ContextKey = "userID"
