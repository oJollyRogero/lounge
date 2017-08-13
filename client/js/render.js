"use strict";

const $ = require("jquery");
const templates = require("../views");
const options = require("./options");
const renderPreview = require("./renderPreview");
const utils = require("./utils");
const sorting = require("./sorting");

const chat = $("#chat");
const sidebar = $("#sidebar");

module.exports = {
	buildChannelMessages,
	buildChatMessage,
	renderChannel,
	renderChannelMessages,
	renderChannelUsers,
	renderNetworks,
};

function buildChannelMessages(channel, messages) {
	return messages.reduce(function(docFragment, message) {
		docFragment.append(buildChatMessage({
			chan: channel,
			msg: message
		}));
		return docFragment;
	}, $(document.createDocumentFragment()));
}

function buildChatMessage(data) {
	const type = data.msg.type;
	let template = "msg";

	if (!data.msg.highlight && !data.msg.self && (type === "message" || type === "notice") && options.highlights.some(function(h) {
		return data.msg.text.toLocaleLowerCase().indexOf(h.toLocaleLowerCase()) > -1;
	})) {
		data.msg.highlight = true;
	}

	if ([
		"invite",
		"join",
		"mode",
		"kick",
		"nick",
		"part",
		"quit",
		"topic",
		"topic_set_by",
		"action",
		"whois",
		"ctcp",
		"channel_list",
		"ban_list",
	].indexOf(type) !== -1) {
		template = "msg_action";
	} else if (type === "unhandled") {
		template = "msg_unhandled";
	}

	const msg = $(templates[template](data.msg));
	const content = msg.find(".content");

	if (template === "msg_action") {
		content.html(templates.actions[type](data.msg));
	}

	data.msg.previews.forEach((preview) => {
		renderPreview(preview, msg);
	});

	return msg;
}

function renderChannel(data) {
	renderChannelMessages(data);

	if (data.type === "channel") {
		renderChannelUsers(data);
	}
}

function renderChannelMessages(data) {
	const documentFragment = buildChannelMessages(data.id, data.messages);
	const channel = chat.find("#chan-" + data.id + " .messages").append(documentFragment);

	if (data.firstUnread > 0) {
		const first = channel.find("#msg-" + data.firstUnread);

		// TODO: If the message is far off in the history, we still need to append the marker into DOM
		if (!first.length) {
			channel.prepend(templates.unread_marker());
		} else {
			first.before(templates.unread_marker());
		}
	} else {
		channel.append(templates.unread_marker());
	}

	if (data.type !== "lobby") {
		let lastDate;
		$(chat.find("#chan-" + data.id + " .messages .msg[data-time]")).each(function() {
			const msg = $(this);
			const msgDate = new Date(msg.attr("data-time"));

			// Top-most message in a channel
			if (!lastDate) {
				lastDate = msgDate;
				msg.before(templates.date_marker({msgDate: msgDate}));
			}

			if (lastDate.toDateString() !== msgDate.toDateString()) {
				msg.before(templates.date_marker({msgDate: msgDate}));
			}

			lastDate = msgDate;
		});
	}
}

function renderChannelUsers(data) {
	const users = chat.find("#chan-" + data.id).find(".users");
	const nicks = data.users
		.concat() // Make a copy of the user list, sort is applied in-place
		.sort((a, b) => b.lastMessage - a.lastMessage)
		.map((a) => a.nick);

	const search = users
		.find(".search")
		.attr("placeholder", nicks.length + " " + (nicks.length === 1 ? "user" : "users"));

	users
		.data("nicks", nicks)
		.find(".names-original")
		.html(templates.user(data));

	// Refresh user search
	if (search.val().length) {
		search.trigger("input");
	}
}

function renderNetworks(data) {
	sidebar.find(".empty").hide();
	sidebar.find(".networks").append(
		templates.network({
			networks: data.networks
		})
	);

	const channels = $.map(data.networks, function(n) {
		return n.channels;
	});
	chat.append(
		templates.chat({
			channels: channels
		})
	);
	channels.forEach((channel) => {
		renderChannel(channel);

		if (channel.type === "channel") {
			chat.find("#chan-" + channel.id).data("needsNamesRefresh", true);
		}
	});

	utils.confirmExit();
	sorting();

	if (sidebar.find(".highlight").length) {
		utils.toggleNotificationMarkers(true);
	}
}
