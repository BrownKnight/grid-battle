using System.Runtime.CompilerServices;

namespace GridBattle.Api;

public sealed class RequestValidationException(string fieldName, string reason)
    : Exception($"{fieldName} {reason}")
{
    public string FieldName { get; } = fieldName;

    public static void AssertAtLeast(
        string field,
        int length,
        [CallerArgumentExpression(nameof(field))] string fieldName = ""
    )
    {
        if (field.Length <= length)
            throw new RequestValidationException(fieldName, $"must be at least 4 characters long");
    }

    public static void AssertExactly(
        string field,
        int length,
        [CallerArgumentExpression(nameof(field))] string fieldName = ""
    )
    {
        if (field.Length != length)
            throw new RequestValidationException(fieldName, $"must be 4 characters long");
    }

    public static void AssertIsNotNullOrEmpty(
        string field,
        [CallerArgumentExpression(nameof(field))] string fieldName = ""
    )
    {
        if (string.IsNullOrEmpty(field))
            throw new RequestValidationException(fieldName, $"must be at least 4 characters long");
    }
}
