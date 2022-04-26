const { Schema } = require("mongoose");

const UserSchema = new Schema(
  {
    twitch: {
      id: { type: String, required: false },
      display_name: { type: String, required: false },
      profile_image_url: { type: String, required: false },
      oauth: {
        access_token: { type: String, required: false },
        refresh_token: { type: String, required: false },
        type: Object,
        required: false,
      },
      type: Object,
      default: undefined,
      required: false,
    },

    wallet_address: { type: String, required: true, unique: true },
    nonce: { type: String, required: true },
    authority: {
      type: String,
      default: "normal",
      required: true,
      enum: ["normal", "admin"],
    },
    enabled: { type: Boolean, required: false },
  },

  {
    // createdat, updatedat
    timestamps: true,
  },
);

module.exports = UserSchema;
// module.exports = mongoose.model("User", UserSchema);
