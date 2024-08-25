using System.Security.Cryptography;

namespace GridBattle.Data;

internal static class IdCodeGenerator
{
    private static readonly char[] _idChars = "ABCDEFGHIJKLMNOPQRSTURWXYZ".ToCharArray();

    public static string GenerateId(int length)
    {
        return new string(RandomNumberGenerator.GetItems<char>(_idChars.AsSpan(), length));
    }
}
