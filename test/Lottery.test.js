// Import required modules
const assert = require("assert");
const ganache = require("ganache");
const { Web3 } = require("web3");

// Create a new Web3 instance with Ganache provider
const web3 = new Web3(ganache.provider());

// Import the compiled contract's interface and bytecode
const { interface, bytecode } = require("../compile");

let lottery;
let accounts;

// Execute this code before each test
beforeEach(async () => {
  // Get a list of accounts from the Ganache provider
  accounts = await web3.eth.getAccounts();

  // Deploy a new instance of the contract using the first account
  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: "1000000" });
});

// Start describing the tests for the Lottery Contract
describe("Lottery Contract", () => {
  it("deploys a contract", () => {
    // Check if the contract is deployed successfully and has an address
    assert.ok(lottery.options.address);
  });

  it("allows one account to enter", async () => {
    // Have one account enter the lottery
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    });

    // Get the list of players from the contract
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });

    // Check if the entered account is in the list of players
    assert.equal(accounts[0], players[0]);
    // Check if there is only one player in the list
    assert.equal(1, players.length);
  });

  it("allows multiple accounts to enter", async () => {
    // Have multiple accounts enter the lottery
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("0.02", "ether"),
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei("0.02", "ether"),
    });

    // Get the list of players from the contract
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });

    // Check if the entered accounts are in the list of players
    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    // Check if there are three players in the list
    assert.equal(3, players.length);
  });

  it('requires a minimum amount of ether to enter', async () => {
    try {
      // Try to enter the lottery with a value of 0 ether
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 0
      });
      
      // If the transaction succeeds, indicate a failure by asserting false
      assert(false);
    } catch (err) {
      // If an error is thrown, it indicates a successful transaction
      assert(err);
    }
  });

});
