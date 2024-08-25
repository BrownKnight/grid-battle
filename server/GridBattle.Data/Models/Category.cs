namespace GridBattle.Data;

public sealed record Category
{
    public required string Name { get; set; }
    public required List<string> Answers { get; set; }
}
