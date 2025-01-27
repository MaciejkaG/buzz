"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { initSocket, getSocket } from "@/lib/socket";
import { useDictionary } from "@/components/DictionaryProvider";
import useLocaleRouter from "@/lib/locale-router";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Snippet,
  Spacer,
  Checkbox,
  Button,
  Tooltip,
} from "@heroui/react";

import "@/styles/host.css";

export default function Host() {
  let dict = useDictionary();

  const locale = dict._lang;
  dict = dict.host;

  const router = useLocaleRouter(locale);

  const [roomId, setRoomId] = useState("");
  const [players, setPlayers] = useState([]);
  const [buzzes, setBuzzes] = useState([]);
  const [isBuzzerLocked, setIsBuzzerLocked] = useState(false);

  const [latencyCorrectionOn, setlatencyCorrection] = useState(true);

  useEffect(() => {
    const socket = initSocket();

    socket.emit("create-room", (roomId) => {
      setRoomId(roomId);
    });

    socket.on("playerlist-update", ({ players }) => {
      setPlayers(players);
    });

    socket.on("buzzer-update", ({ buzzOrder }) => {
      setBuzzOrder(buzzOrder);
    });

    socket.on("buzzer-lock-update", ({ isLocked }) => {
      setIsBuzzerLocked(isLocked);
    });

    socket.on("buzzes-update", ({ buzzes }) => {
      setBuzzes(buzzes.sort((a, b) => a.realTime - b.realTime));
    });

    socket.on("buzzer-reset", () => {
      setBuzzes([]);
    });

    return () => {
      socket.off("playerlist-update");
      socket.off("buzzer-update");
      socket.off("buzzer-lock-update");
      socket.off("buzzes-update");
      socket.off("buzzer-reset");
    };
  }, []);

  const handleSettingChange = (key, value) => {
    const socket = getSocket();
    socket.emit("setting-change", { key, value });
  };

  const handleToggleBuzzerLock = () => {
    const socket = getSocket();
    console.log("emit");
    socket.emit("toggle-buzzer-lock");
  };

  const handleReset = () => {
    const socket = getSocket();
    socket.emit("reset-buzzers");
  };

  const handleKickPlayer = (playerIndex) => {
    const socket = getSocket();
    socket.emit("kick-player", { playerIndex });
  };

  return (
    <div className="mt-16 mx-2 sm:mx-4 flex gap-4 items-start flex-wrap">
      <div className="flex-1 flex flex-col gap-4">
        <Card className="flex-1 min-w-fit">
          <CardBody>
            <h2 className="text-2xl sm:text-3xl text-nowrap font-bold flex flex-col sm:flex-row gap-2 items-center justify-between">
              {dict.general.roomCode}{" "}
              <Snippet
                hideSymbol
                disableTooltip
                color="primary"
                className="text-3xl sm:text-4xl"
              >
                {roomId}
              </Snippet>
            </h2>
            <Spacer y={4} />
            <h2 className="text-xl sm:text-2xl sm:text-nowrap flex flex-col sm:flex-row gap-2 items-center justify-between">
              {dict.general.joinAt}{" "}
              <Snippet
                hideSymbol
                disableTooltip
                color="secondary"
                className="text-2xl sm:text-3xl"
              >
                buzz.mcjk.cc
              </Snippet>
            </h2>
          </CardBody>
        </Card>
        <Card className="flex-1">
          <CardHeader className="flex justify-between items-center">
            <h2>{dict.playerList.title}</h2>
            <Checkbox defaultSelected>
              {dict.playerList.preventJoining}
            </Checkbox>
          </CardHeader>
          <Divider />
          <CardBody>
            {/* Player list */}
            <AnimatePresence>
              {players.length > 0 ? (
                players.map((player, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Card className="bg-default-100 mb-2">
                      <CardBody>
                        <p className="flex justify-between items-center">
                          <span>{player}</span>
                          <Button
                            size="sm"
                            color="danger"
                            onPress={() => handleKickPlayer(index)}
                          >
                            {dict.playerList.kick}
                          </Button>
                        </p>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <p className="text-center">{dict.playerList.placeholder}</p>
              )}
            </AnimatePresence>
          </CardBody>
        </Card>
      </div>
      <div className="flex-1 min-w-fit">
        <Card className="flex-1">
          <CardHeader className="flex justify-between items-center">
            <h2>{dict.buzzerHistory.title}</h2>
            <Checkbox
              isSelected={isBuzzerLocked}
              onValueChange={handleToggleBuzzerLock}
            >
              {dict.buzzerHistory.preventBuzzers}
            </Checkbox>
          </CardHeader>
          <Divider />
          <CardBody>
            {/* Buzzes list */}
            <AnimatePresence>
              {buzzes.length > 0 ? (
                buzzes.map((buzz, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                  >
                    <Card className="bg-default-100 mb-2">
                      <CardBody>
                        <p className="flex justify-between items-center">
                          <span>{buzz.nickname}</span>
                          <span
                            className={
                              !index ? "text-green-400" : "text-red-400"
                            }
                          >
                            +{(buzz.realTime - buzzes[0].realTime) / 1000}
                          </span>
                        </p>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <p className="text-center">{dict.buzzerHistory.placeholder}</p>
              )}
            </AnimatePresence>
          </CardBody>
          <Divider />
          <CardFooter className="justify-center">
            <Button color="danger" onPress={handleReset}>
              Reset buzzers
            </Button>
          </CardFooter>
        </Card>
      </div>
      <div className="flex-1 min-w-fit">
        <Card className="flex-1">
          <CardHeader>
            <h2>{dict.roomSettings.title}</h2>
          </CardHeader>
          <Divider />
          <CardBody className="overflow-hidden">
            <span className="flex items-center justify-between">
              <Tooltip
                className="max-w-96"
                placement="under"
                content={dict.roomSettings.latencyCorrection.description}
              >
                {dict.roomSettings.latencyCorrection.title}
              </Tooltip>
              <Checkbox
                isSelected={latencyCorrectionOn}
                onValueChange={() => {
                  setlatencyCorrection(!latencyCorrectionOn);
                  handleSettingChange(
                    "latencyCorrection",
                    !latencyCorrectionOn
                  );
                }}
              />
            </span>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
