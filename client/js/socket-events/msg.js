"use strict";

const $ = require("jquery");
const socket = require("../socket");
const render = require("../render");
const chat = $("#chat");
const templates = require("../../views");

socket.on("msg", function(data) {
	let target = data.chan;
	let channel = chat.find("#chan-" + target);

	// Display received notices and errors in currently active channel,
	// if the actual target is the network lobby.
	// Reloading the page will put them back into the lobby window.
	if (data.msg.showInActive) {
		data.chan = chat.find(".active").data("id");
		target = data.chan;
		channel = chat.find("#chan-" + target);
	}

	const msg = render.buildChatMessage(data);
	const container = channel.find(".messages");

	const activeChannelId = chat.find(".chan.active").data("id");

	if (data.msg.type === "channel_list" || data.msg.type === "ban_list") {
		$(container).empty();
	}

	// Check if date changed
	const prevMsg = $(container.find(".msg")).last();
	const prevMsgTime = new Date(prevMsg.attr("data-time"));
	const msgTime = new Date(msg.attr("data-time"));

	// It's the first message in a channel/query
	if (prevMsg.length === 0) {
		container.append(templates.date_marker({msgDate: msgTime}));
	}

	if (prevMsgTime.toDateString() !== msgTime.toDateString()) {
		prevMsg.after(templates.date_marker({msgDate: msgTime}));
	}

	// Add message to the container
	container
		.append(msg)
		.trigger("msg", [
			"#chan-" + target,
			data
		])
		.trigger("keepToBottom");

	var lastVisible = container.find("div:visible").last();
	if (data.msg.self
		|| lastVisible.hasClass("unread-marker")
		|| (lastVisible.hasClass("date-marker")
		&& lastVisible.prev().hasClass("unread-marker"))) {
		container
			.find(".unread-marker")
			.appendTo(container);
	}

	// Message arrived in a non active channel, trim it to 100 messages
	if (activeChannelId !== target && container.find(".msg").slice(0, -100).remove().length) {
		channel.find(".show-more").addClass("show");

		// Remove date-seperators that would otherwise
		// be "stuck" at the top of the channel
		channel.find(".date-marker-container").each(function() {
			if ($(this).next().hasClass("date-marker-container")) {
				$(this).remove();
			}
		});
	}

	if ((data.msg.type === "message" || data.msg.type === "action") && channel.hasClass("channel")) {
		const nicks = channel.find(".users").data("nicks");
		if (nicks) {
			const find = nicks.indexOf(data.msg.from);
			if (find !== -1) {
				nicks.splice(find, 1);
				nicks.unshift(data.msg.from);
			}
		}
	}
});
