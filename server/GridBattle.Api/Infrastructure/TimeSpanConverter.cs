using System.Text.Json;
using System.Text.Json.Serialization;

namespace GridBattle.Api;

public sealed class TimeSpanConverter : JsonConverter<TimeSpan>
{
    public override TimeSpan Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options
    )
    {
        if (reader.TryGetInt64(out var milliseconds))
        {
            return TimeSpan.FromMilliseconds(milliseconds);
        }
        throw new InvalidOperationException("Only millisecond to timespan conversion is supported");
    }

    public override void Write(Utf8JsonWriter writer, TimeSpan value, JsonSerializerOptions options)
    {
        writer.WriteNumberValue(value.TotalMilliseconds);
    }
}
