const { Schema, model } = mongoose;

const canvasSchema = new Schema({
    events: [{ type: Schema.Types.ObjectId, ref: 'Event' }]
});

module.exports = model('Canvas', canvasSchema);
