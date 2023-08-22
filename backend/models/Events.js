const { Schema, model } = mongoose;

const eventSchema = new Schema({
    type: String,
    clientId: String,
    shapeId: String,
    shape: String,
    redraw: Boolean,
    isFinal: Boolean,
    canvas: { type: Schema.Types.ObjectId, ref: 'Canvas' }
});

module.exports = model('Event', eventSchema);
