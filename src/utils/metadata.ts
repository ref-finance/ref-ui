import { getExtraStablePoolConfig } from '../services/config';

const icons: { [tokenId: string]: string } = {
  '4691937a7508860f876c9c0a2a617e7d9e945d4b.factory.bridge.near':
    'https://assets.ref.finance/images/woo-wtrue.png',
  'wrap.near':
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAA0CAYAAADFeBvrAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAYZSURBVHgB1ZpdbBRVFMf/d6Z1Wyi7Y1IiCbSuMUApgRYTCCDIEog+wAMaqwmJgFEfJCagErGJSemLXzGRJkRf/ABiiFoiaJAYI3EFogaMbIE0YIMMHyUIaKYLYpd253rP3Q92u7vdubPTdvtL2pnZmbtzz/zPPefMvcvgIcbUxmbo8ZANNDGbN4MxQ3wcHHKZSX+Mowua2I/rYau3OwKPYCgRY1pDCOBrOMN6OoQ7TA6ENVvvKNU41waRIZzxNrEbgpdwHmGMd1iXenbCBcoGjZghuZhsgC23rp4xVRo5Nsgwgobt97UJ39+MUUS44nbtZqzdskzLyfWODDKmNAR5Jf8RuQN8tHCsVlGDKHJxLU7GuB3wXmExW19eLGhow52cVD9jvTDmBMbeGMKgvlCfhruooEJJZU6gDBFKzSukVF6F5JhJuFlZQn2jPuY7l2MQRbNkACgHNyuE7CP1deiJHIMoNGPsopkKQXuS7GsWWWMoGZ7PYxzBdBHOzTPh1HGWQklXK8qcxlmonzYV5QCP8yyV0gYZdQ0b4MDVlixcgCPf7cPJnw/h9ZdfgtfEG+sR/XQLbu5w/N0hI0gFcoK0QaI+2wRFyCAyzCu1Yi1LcavtGfAJPtiTA47bZaokDTKmTm8WRVMzXEDGlKoWn1iF/zauRv+Tj8AlaZUSCml6yQWnW7VIiVvvPI87y5pQEoN8DW2kQRx8GTxAVa2B+TNw690XlNyrEMkXTGjS3TzOOym1KIAUgsbL7S0tcrx4hMizjc0a9IoQRgBS68CXu/FWWysC/klZ5wbnzyxlvBRmIB7SYNtBlTZ90Zsql+PF59aLML8fa1seT3+mmVehXXf0vqaEraFJ9wVqt0LB5a5dvyG3c2Y3oMrnzF0Cfj9WPbZSqnaq+wyiV6/jnp9OAZWViE8vHESq9h6BCuJtGnp1oHYbFAvRo78ew1ffHJQdnTN7luN2dC0ZRiqfjpxGRdc5YdhJkUzvBzdqcq5XNUgUcv2k0Ha4gDr17feHcPFSryyFAgG/o3Z51frhd+GCfbCD98mclELZICGMXpVQSAkuwizdmN2OyU6RYaWoRd+hX/gLlcf/ACZUIS4MozHmO3gcqrBA3Uyu0oByRqrOqtp7GL7Ou09x1aMrZVSrr1NLrns69+Ht93fg4uXe9D3oYbF/+6GKskLkFndCiaw+KHx/QOzr1yxoV/5Gz7k/8eEnu+W5JYsWOP7OoWpJYwYG4QZm1M08zxWiHFXDVEAOhQa3r/OwHAuEzENf7FZW6+gvx7Dx1da0WoqYus+o3SB2pjhtQeMnpVAm5PeUMJkopPSeK/Jpk1p90SjmP9TkOMTTA1jb8gRisRh+O9EFFRhYRK/2T14k9h1X2oUMkudEoBhsflC6ISlGbkOdUg3xZPzK0FI5tlQSuchDX2tiycOzpYwUQ4tNch9yo42vtMowP2JwmBrig2F4CLvdj+oPDuSNUHv27sPqp9fJJz8iVOphzertiQjn86SwotxR89pHwt0K+35KrdVPrfNaLdMyuyPyfYjZ2IUSqei+gJqtH6ejXDGofJr78AqZf7yAFsxom5xTYPtRApRcJ7Z/5ioRkkFzF68oWS1N1zvklv5Zl+W8VhiK0HiZ8F6nrBhKgdyQ1Gptf1OGeWU4IuRutKunPhPh+4IYSxuKtaUsPrC4URpT88ZOVIic4xWZIZ7qQ/pzAmN2a3/0H2lQ1sypqOtoojGE8YXZd+nsA6mDrJlTxlk7xhk0FZx5rGce9EdvmNX+2nuFbgsxDhCVQYd18eznmZ/lrg9VxLYh8eOIcsdM9jWLHIMs07SkjB4l2xHCSqw65K6M513BE8sTJtP05ShTmK7TEoqZ71zBRWOK66IcfxZlBvUplXPyny8CzUZyW6y38jJY1pfKDL+s7+yHF0Gxshcf4x9eJFbqzGIXanCAHFN6bB6FSYwydE+6txNj5PVQZLTUEkk+LDbtyTrTeTu4RC5hcr5JLGO4WigrhFtD0u1RIhQ0ELc3J9eYgnCHJVxrF73GuDUkRckGZSKNs+Mh2MIwxsRMCg8OnSJjlOG5SNo0l8F4l3iRCReLXCr8DwK8kDxwgSOUAAAAAElFTkSuQmCC',
  'wrap.testnet':
    'data:image/png;base64,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',
  '6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near':
    'https://assets.ref.finance/images/4943.png',
  'berryclub.ek.near': 'https://assets.ref.finance/images/banana.png',
  'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near':
    'https://assets.ref.finance/images/825.png',
  '1f9840a85d5af5bf1d1762f925bdaddc4201f984.factory.bridge.near':
    'https://assets.ref.finance/images/7083.png',
  '514910771af9ca656af840dff83e8264ecf986ca.factory.bridge.near':
    'https://assets.ref.finance/images/1975.png',
  'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near':
    'https://assets.ref.finance/images/3408.png',
  '2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near':
    'https://assets.ref.finance/images/3717.png',
  '7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9.factory.bridge.near':
    'https://assets.ref.finance/images/7278.png',
  'a0b73e1ff0b80914ab6fe0444e65848c4c34450b.factory.bridge.near':
    'https://assets.ref.finance/images/3635.png',
  '50d1c9771902476076ecfc8b2a83ad6b9355a4c9.factory.bridge.near':
    'https://assets.ref.finance/images/4195.png',
  '4fabb145d64652a948d72533023f6e7a623c7c53.factory.bridge.near':
    'https://assets.ref.finance/images/4687.png',
  '6f259637dcd74c767781e37bc6133cd6a68aa161.factory.bridge.near':
    'https://assets.ref.finance/images/2502.png',
  '6b3595068778dd592e39a122f4f5a5cf09c90fe2.factory.bridge.near':
    'https://assets.ref.finance/images/6758.png',
  'c011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f.factory.bridge.near':
    'https://assets.ref.finance/images/2586.png',
  'c944e90c64b2c07662a292be6244bdf05cda44a7.factory.bridge.near':
    'https://assets.ref.finance/images/6719.png',
  '9f8f72aa9304c8b593d555f12ef6589cc3a579a2.factory.bridge.near':
    'https://assets.ref.finance/images/1518.png',
  '0bc529c00c6401aef6d220be8c6ea1667f6ad93e.factory.bridge.near':
    'https://assets.ref.finance/images/5864.png',
  'c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.factory.bridge.near':
    'https://assets.ref.finance/images/2396.png',
  '0316eb71485b0ab14103307bf65a021042c6d380.factory.bridge.near':
    'https://assets.ref.finance/images/6941.png',
  '111111111117dc0aa78b770fa6a738034120c302.factory.bridge.near':
    'https://assets.ref.finance/images/8104.png',
  'f5cfbc74057c610c8ef151a439252680ac68c6dc.factory.bridge.near':
    'https://assets.ref.finance/images/55sGoBm.png',
  'de30da39c46104798bb5aa3fe8b9e0e1f348163f.factory.bridge.near':
    'https://assets.ref.finance/images/10052.png',
  'a4ef4b0b23c1fc81d3f9ecf93510e64f58a4a016.factory.bridge.near':
    'https://assets.ref.finance/images/4222.png',
  'token.cheddar.near': 'https://assets.ref.finance/images/cheddar.png',
  'farm.berryclub.ek.near': 'https://assets.ref.finance/images/cucumber.png',
  'd9c2d319cd7e6177336b0a9c93c21cb48d84fb54.factory.bridge.near':
    'https://assets.ref.finance/images/HAPI.png',
  'sol.token.a11bd.near': 'https://assets.ref.finance/images/SOLAllbridge.png',
  'a663b02cf0a4b149d2ad41910cb81e23e1c41c32.factory.bridge.near':
    'https://assets.ref.finance/images/sFRAX_coin.svg',
  '853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near':
    'https://assets.ref.finance/images/FRAX_coin.svg',
  'blackdragon.tkn.near':
    'https://assets.ref.finance/images/blackdragon-icon.png',
  '22.contract.portalbridge.near':
    'https://assets.ref.finance/images/SOLWormhole.svg',
  'babyblackdragon.tkn.near':
    'https://assets.ref.finance/images/babyblackdragon.png',
  'intel.tkn.near': 'https://assets.ref.finance/images/intel.jpeg',
};

export default icons;
