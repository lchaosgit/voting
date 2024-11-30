const { expect } = require("chai");

describe("Voting", function () {
    it("Should count votes correctly", async function () {
        const Voting = await ethers.getContractFactory("Voting");
        const voting = await Voting.deploy();
        await voting.deployed();

        await voting.vote(ethers.utils.formatBytes32String("Option1"));
        expect(await voting.votes(ethers.utils.formatBytes32String("Option1"))).to.equal(1);
    });
});
