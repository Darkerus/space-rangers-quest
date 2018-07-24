import * as React from "react";
import { Loader, DivFadeinCss, Tabs } from "./common";
import { LangTexts } from "./lang";
import { DB, WonProofs } from "./db";
import { Player, Lang } from "../lib/qmplayer/player";
import { GameState, initGame, performJump, Quest } from "../lib/qmplayer/funcs";
import { JUMP_I_AGREE } from "../lib/qmplayer/defs";
import { Index, Game } from "../packGameData";
import { AppNavbar } from "./appNavbar";
import {
    ButtonDropdown,
    DropdownMenu,
    DropdownToggle,
    DropdownItem
} from "reactstrap";
import {
    HashRouter,
    Switch,
    Route,
    Redirect,
    RouteComponentProps
} from "react-router-dom";
import moment from "moment";
import { replaceTags } from "./questReplaceTags";
import { substitute } from "../lib/substitution";
import { DEFAULT_DAYS_TO_PASS_QUEST } from "../lib/qmplayer/defs";
import { SRDateToString } from "../lib/qmplayer/funcs";
import classnames from "classnames";

import { DATA_DIR } from "./consts";
import { parse } from "../lib/qmreader";
import * as pako from "pako";


export class QuestPlayRouter extends React.Component<
    {
        l: LangTexts;
        index: Index;
        player: Player;
        db: DB;
        firebaseLoggedIn: firebase.User | null | undefined;
    },
    {}
> {
    render() {
        const { l, firebaseLoggedIn, player, index, db } = this.props;
        return (
            <Route
                exact
                path={"/quests/:gameName/:playing?"}
                render={prop => {
                    const gameName = prop.match.params.gameName;
                    const isPlaying = prop.match.params.playing === "play";

                    const game = index.quests.find(
                        x => x.gameName === gameName
                    );
                    if (!game) {
                        return <Redirect to="#/" />;
                    }
                    return (
                        <QuestPlay
                            key={gameName}
                            {...this.props}
                            gameName={gameName}
                            game={game}
                            isPlaying={isPlaying}
                            onPlayChange={newPlaying => prop.history.push(
                                `/quests/${gameName}` + (
                                    newPlaying ? '/play' : '')                                
                            )}
                        />
                    );
                }}
            />
        );
    }
}

interface QuestPlayState {
    passedQuests?: WonProofs;
    gameState?: GameState | null;
    gameStateLoaded?: boolean;
    quest?: Quest; 
    error?: string | Error;
}
class QuestPlay extends React.Component<
    {
        l: LangTexts;
        index: Index;
        player: Player;
        db: DB;
        firebaseLoggedIn: firebase.User | null | undefined;
        gameName: string;
        game: Game;
        isPlaying: boolean;
        onPlayChange: (newPlaying: boolean) => void
    },
    QuestPlayState
> {
    state: QuestPlayState = {};

    loadComments = () => {
        // TODO
    };

    loadQuest() {        
        fetch(DATA_DIR + this.props.game.filename).then(
            res => res.arrayBuffer()
        ).then(arrayBuf => {
            const quest = parse(new Buffer(pako.ungzip(new Buffer(arrayBuf))));
            console.info(quest);
        })
    }
    componentDidMount() {
        if ( this.props.isPlaying ) {
            this.loadQuest();
        } else {
            this.loadComments();
        } 

        this.props.db
            .getOwnWonGames()
            .then(passedQuests => this.setState({ passedQuests }))
            .catch(e => undefined);
        this.props.db
            .getSavedGame(this.props.gameName)
            .catch(e => undefined)
            .then(gameState =>
                this.setState({ gameState, gameStateLoaded: true })
            );
    }
    render() {
        const {
            l,
            index,
            player,
            db,
            firebaseLoggedIn,            
            isPlaying,
            game
        } = this.props;
        
        const passedQuests = this.state.passedQuests;
        if (this.state.error) {
            return <>
                    <AppNavbar
                        l={l}
                        player={player}
                        firebaseLoggedIn={firebaseLoggedIn}
                    />
                    <div className="text-center text-danger">
                    {this.state.error.toString()}
                    </div>
                    </>
        }
        
        if (!isPlaying) {
            return (
                <>
                    <AppNavbar
                        l={l}
                        player={player}
                        firebaseLoggedIn={firebaseLoggedIn}
                    />
                    <DivFadeinCss className="container">
                        <div className="text-center mb-3">
                            <h4>{game.gameName}</h4>
                            <div>
                                <small>{game.smallDescription}</small>
                            </div>
                            <div>
                                <small>
                                    {(() => {
                                        // copy-paste from questList
                                        if (!passedQuests) {
                                            return (
                                                <i className="text-muted fa fa-spin circle-o-notch" />
                                            );
                                        }
                                        const passed =
                                            passedQuests[game.gameName];
                                        const lastStep = passed
                                            ? passed.performedJumps
                                                  .slice(-1)
                                                  .shift()
                                            : undefined;
                                        if (!lastStep) {
                                            return null;
                                        }

                                        return (
                                            <span>
                                                {l.passed}{" "}
                                                {moment(
                                                    lastStep.date.toISOString()
                                                ).format("lll")}
                                            </span>
                                        );
                                    })()}
                                </small>
                            </div>
                        </div>
                        <div className="mb-3">
                            {replaceTags(
                                substitute(
                                    game.taskText,
                                    {
                                        ...player,
                                        Day: `${DEFAULT_DAYS_TO_PASS_QUEST}`,
                                        Date: SRDateToString(
                                            DEFAULT_DAYS_TO_PASS_QUEST,
                                            player.lang
                                        ),
                                        CurDate: SRDateToString(0, player.lang)
                                    },
                                    [],
                                    n =>
                                        n !== undefined
                                            ? Math.floor(Math.random() * n)
                                            : Math.random()
                                )
                            )}
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <button
                                    className={classnames("btn btn-block", {
                                        "btn-primary":
                                            this.state.gameStateLoaded &&
                                            !this.state.gameState
                                    })}
                                    onClick={async () => {
                                        await db.setSavedGame(game.gameName, null);
                                        this.loadQuest();
                                        this.props.onPlayChange(true);                                        
                                    }}
                                >
                                    <i className="fa fa-rocket" />{" "}
                                    {l.startFromTheStart}
                                </button>
                            </div>
                            <div className="col-md-6">
                                <button
                                    className={classnames("btn btn-block", {
                                        "btn-primary":
                                            this.state.gameStateLoaded &&
                                            this.state.gameState,
                                        disabled: !this.state.gameState
                                    })}
                                    onClick={() => {
                                        this.loadQuest();
                                        this.props.onPlayChange(true)
                                    }}
                                >
                                    {!this.state.gameStateLoaded ? (
                                        <Loader />
                                    ) : this.state.gameState ? (
                                        <>
                                            <i className="fa fa-save" />{" "}
                                            {l.startFromLastSave}
                                        </>
                                    ) : (
                                        <>
                                            {" "}
                                            <i className="fa fa-circle-o" />{" "}
                                            {l.noLastSave}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </DivFadeinCss>
                </>
            );
        }
        return <div>TODO</div>;
    }
}
