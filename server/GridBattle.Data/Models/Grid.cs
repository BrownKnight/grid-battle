namespace GridBattle.Data;

public sealed record Grid
{
    public required string Id { get; set; }
    public required GridSource Source { get; set; }
    public required DateTimeOffset CreatedDateTime { get; set; }
    public required DateTimeOffset CreatedBy { get; set; }
    public required List<Category> Categories { get; set; }
}
